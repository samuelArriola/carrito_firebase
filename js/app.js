import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { login, logout, addData, getData, deleteData } from './firestone.js';


const btn_login = document.getElementById('btn-login');
const btn_logout = document.getElementById('btn-logout');
const container = document.getElementById('contenedor');

const modalAvatar = document.getElementById('modalAvatar');
const formAvatar = document.getElementById('formAvatar');
const nombreAvatar = document.getElementById('nombreAvatar');
const precioAvatar = document.getElementById('precioAvatar');
const imgAvatar = document.getElementById('imgAvatar');
const containerAvatar = document.getElementById('container-Avatar');
const templateAvatar = document.getElementById('template-avatar').content;
const containerCarrito = document.getElementById('containerCarrito');
const templateCarrito = document.getElementById('templateCarrito').content;
const containerCarritoFooter = document.getElementById('containerCarritoFooter');
const templateCarritoFooter = document.getElementById('templateCarritoFooter').content;
const fragment = document.createDocumentFragment();
let avatar = {};
let carrito = {};

const auth = getAuth();
let dataUser;

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        dataUser = user;
        mostrar();
        mostarAvart();
    } else {
        console.log('Usuarion sin logear');
        quitar();
    }
})

//Cerrar session
btn_logout.addEventListener('click', async() => {
    try {
        await logout();
    } catch (error) {
        console.log(error);
    }
});

//Iniciar session
btn_login.addEventListener('click', async() => {
    try {
        await login();
    } catch (error) {
        console.log(error);
    }
})

const mostrar = () => {
    container.classList.remove('hidden');
    btn_login.classList.add('hidden');
}

const quitar = () => {
    container.classList.add('hidden');
    btn_login.classList.remove('hidden');
}

//Guardar data 
modalAvatar.addEventListener('submit', (e) => {
    const data = {
        nombre: nombreAvatar.value,
        precio: precioAvatar.value,
        img: imgAvatar.value,
        fecha: serverTimestamp(),
        responsable: dataUser.uid
    }

    addAvatar(data);
    mostarAvart();
    e.preventDefault();
})

const addAvatar = async(data) => {
    try {
        const res = await addData(data);
        renderAvatar();
    } catch (error) {
        console.log(error);
    }
}


//Mostrar Avater
const mostarAvart = async() => {
    avatar = {};
    try {
        const res = await getData();
        avatar = {...res };
        renderAvatar();
    } catch (error) {
        console.log(error);
    }

}

const renderAvatar = () => {
    containerAvatar.innerHTML = '';
    Object.values(avatar).forEach(element => {
        templateAvatar.querySelector('h5').textContent = element.data.nombre;
        templateAvatar.querySelectorAll('button')[0].dataset.id = element.id;
        templateAvatar.querySelectorAll('button')[1].dataset.id = element.id;
        templateAvatar.querySelector('p').textContent = sepradorDeMil(element.data.precio);
        templateAvatar.querySelector('img').src = element.data.img;
        const clone = templateAvatar.cloneNode(true);
        fragment.appendChild(clone)
    });

    containerAvatar.appendChild(fragment);

}

const sepradorDeMil = dato => new Intl.NumberFormat().format(dato);
const reversepradorDeMil = dato => dato.replace(/[.]/g, '');

containerAvatar.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-danger')) {
        return borrarAvatar(e.target.parentElement); //mando los elementos de la targeta
    } else if (e.target.classList.contains('btn-primary')) {
        return aggCarrito(e.target.parentElement);
    }
    e.stopPropagation();
})

//BORRAR AVATAR
const borrarAvatar = async(avatarCard) => {
    const idDocument = avatarCard.querySelectorAll('button')[1].dataset.id;
    try {
        await deleteData(idDocument);
        mostarAvart();
    } catch (error) {
        console.log(error);
    }
}

//agregar al carrito
const aggCarrito = (data) => {
    const compra = {
        id: data.querySelector('button').dataset.id,
        nombre: data.querySelector('h5').textContent,
        precio: reversepradorDeMil(data.querySelector('p').textContent),
        cantidad: 1,
    }

    if (carrito.hasOwnProperty(compra.id)) {
        compra.cantidad = carrito[compra.id].cantidad + 1;
    }

    carrito[compra.id] = {...compra };
    pintarCarrito();
}

const pintarCarrito = () => {
    containerCarrito.innerHTML = '';
    Object.values(carrito).forEach(element => {
        templateCarrito.querySelector('th').textContent = element.id;
        templateCarrito.querySelectorAll('td')[0].textContent = element.nombre;
        templateCarrito.querySelectorAll('td')[1].textContent = element.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = element.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = element.id;
        templateCarrito.querySelectorAll('td')[3].textContent = sepradorDeMil(element.cantidad * element.precio);
        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    });
    containerCarrito.appendChild(fragment);
    pintarCarritoFooter();
}

const pintarCarritoFooter = () => {
    containerCarritoFooter.innerHTML = '';
    const totalCantidad = Object.values(carrito).reduce((acu, { cantidad }) => acu + cantidad, 0);
    const totalTotal = Object.values(carrito).reduce((acu, { cantidad, precio }) => acu + cantidad * precio, 0);

    templateCarritoFooter.querySelectorAll('th')[2].textContent = totalCantidad;
    templateCarritoFooter.querySelector('span').textContent = sepradorDeMil(totalTotal);
    const clone = templateCarritoFooter.cloneNode(true);
    containerCarritoFooter.appendChild(clone);

    const btn_vaciar_carrito = document.getElementById('vaciar-carrito');
    btn_vaciar_carrito.addEventListener('click', () => {
        carrito = {};
        pintarCarrito();
    })

}

containerCarrito.addEventListener('click', (e) => {

    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad = carrito[e.target.dataset.id].cantidad + 1;
        carrito[e.target.dataset.id] = {...producto }
        pintarCarrito();
    }
    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad = carrito[e.target.dataset.id].cantidad - 1;
        carrito[e.target.dataset.id] = {...producto }
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito();
    }
    e.stopPropagation();
});