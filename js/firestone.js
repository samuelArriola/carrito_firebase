import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
const provider = new GoogleAuthProvider();
const auth = getAuth();
auth.languageCode = 'es';
const db = getFirestore();

//LOGIN GOOGLE
export async function login() {
    try {
        const res = await signInWithPopup(auth, provider);
        const credential = await GoogleAuthProvider.credentialFromResult(res);
        const token = await credential.accessToken;
        const user = await res.user;

        return user;
    } catch (error) {
        throw new Error(error)
    }
}

//LOGOUT GOOGLE
export async function logout() {
    try {
        await signOut(auth);
        console.log('seccion cerrada');
    } catch (error) {
        throw new Error(error);
    }
}

//Agregar data
export async function addData(data) {
    try {
        const docRef = await addDoc(collection(db, "Avatar"), data);
        console.log("Document written with ID: ", docRef.id);
        return docRef;
    } catch (error) {
        throw new Error(error);
    }
}

//Mostrar Avatar

export async function getData(params) {
    try {
        let avatar = {};
        const res = await getDocs(collection(db, "Avatar"));
        res.forEach((doc) => {
            avatar[doc.id] = { id: doc.id, data: doc.data() }
        });

        return avatar;
    } catch (error) {
        throw new Error(error)
    }
}

//Borrar Avatar

export async function deleteData(idDocument) {
    try {
        await deleteDoc(doc(db, "Avatar", idDocument));
    } catch (error) {
        throw new Error(error)
    }

}