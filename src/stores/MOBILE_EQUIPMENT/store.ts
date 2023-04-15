import { defineStore } from 'pinia'
import { serverTimestamp, updateDoc } from 'firebase/firestore'
// import Api from '@/api/fetchWrapper'
import STATUS from '@/dataType'
import { v4 as uuidv4 } from 'uuid'
import { doc, setDoc, getDocs, collection } from 'firebase/firestore'
import db from '@/firebaseConfig'
import useUiStore from '../ui'
const initialState: any = {}
const mobileEqStore = defineStore('mobileEq', {
  state: () => {
    return {
      data: initialState,
      loading: false,
      fetching: false,
      ui: useUiStore()
    }
  },
  getters: {
    getFormatted: (state) => {
      return state.data
    }
  },
  actions: {
    async getData() {
      if ((Object as any).values(this.data).length === 0) {
        this.fetching = true
        const snap = await getDocs(collection(db, 'MOBILE_EQUIPMENT'))
        snap.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          this.data[doc.id] = doc.data()
        })

        this.fetching = false
      }
    },
    async addData({ data, callback }: { data: any; callback?: () => void }) {
      try {
        this.loading = true
        const id = uuidv4()
        const toSave = {
          ...data,
          id,
          status: STATUS.PENDING,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        await setDoc(doc(db, 'MOBILE_EQUIPMENT/' + id), toSave)
        this.data[id] = toSave
        this.ui.notifySuccess({ message: 'Équipement ajouté' })
        callback?.()
      } catch (err) {
        console.log(err)
      } finally {
        this.loading = false
      }

      //this.data.push({ ...data, type: data?.type?.frName, status: STATUS.PENDING })
    },
    async updateData({ data, callback, id }: { data: any; callback?: () => void; id: string }) {
      try {
        this.loading = true
        delete data.createdAt

        const toUpdate = {
          ...data,
          status: STATUS.PENDING,

          updatedAt: serverTimestamp()
        }

        await updateDoc(doc(db, 'FIXE_EQUIPMENT/' + id), toUpdate)
        this.data[id] = { ...this.data[id], ...toUpdate }
        this.ui.notifySuccess({ message: 'Mise à jour éffectué' })
        callback?.()
      } catch (err) {
        console.log(err)
      } finally {
        this.loading = false
      }
    }
  }
})
export default mobileEqStore