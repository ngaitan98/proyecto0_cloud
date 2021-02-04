import './App.css';
import { React, useState, useEffect } from 'react';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  useLocation
} from "react-router-dom";
function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/home">
            <EventList />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const history = useHistory();
  return (
    <div className="Center-flex">
      <div className="form-group">
        <h1>Iniciar Sesión</h1>
        <form className="vertical-form">
          <label>
            Correo:
          </label>
          <input onChange={(e) => setEmail(e.target.value)} placeholder="Ingrese su correo" type="text"></input>
          <label>
            Contraseña:
          </label>
          <input onChange={(e) => setPassword(e.target.value)} placeholder="Ingrese su contraseña" type="password"></input>
          <button type="button" className="primary" onClick={login}>Iniciar Sesión</button>
          <span className="centered">¿No tienes una cuenta? <a className="secondary" href="/register">Regístrate </a></span>
          {showAlert ? <Alert variant="warning">{message}</Alert> : <div />}
        </form>
      </div>
    </div>
  )
  function login() {
    axios.post("http://172.24.98.145:5000/login", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      "email": email,
      "password": password
    }).then(res => {
      if (res.data.length) {
        history.push(`/home?user_id=${res.data[0].id}`)
        window.location.reload()
        setShowAlert(false)
      }
      else {
        console.log("Hola")
        setMessage("Invalid email or password")
        setShowAlert(true)
      }
    })

  }
}

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const history = useHistory();
  return (
    <div className="Center-flex">
      <div className="form-group">
        <h1>Registrarse</h1>
        <form className="vertical-form">
          <label>
            Nombre:
          </label>
          <input onChange={(e) => setName(e.target.value)} placeholder="Ingrese su nombre" type="text"></input>
          <label>
            Apellido:
          </label>
          <input onChange={(e) => setSurname(e.target.value)} placeholder="Ingrese su apellido" type="text"></input>
          <label>
            Correo:
          </label>
          <input onChange={(e) => setEmail(e.target.value)} placeholder="Ingrese su correo" type="text"></input>
          <label>
            Contraseña:
          </label>
          <input onChange={(e) => setPassword(e.target.value)} placeholder="Ingrese su contraseña" type="password"></input>
          <button type="button" className="primary" onClick={register}>Registrarse</button>
          <span className="centered">¿Ya tienes una cuenta? <a className="secondary" href="/">Inicia Sesión </a></span>
          {showAlert ? <Alert variant="warning">{message}</Alert> : <div />}
        </form>
      </div>
    </div>
  )
  function register() {
    axios.post("http://172.24.98.145:5000/register", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      "email": email,
      "password": password,
      "name": name,
      "surname": surname
    }).then(res => {
      console.log(res)
      if (res.data) {
        history.push("/")
        window.location.reload()
        setShowAlert(false)
      }
      else {
        setMessage("Invalid email or password")
        setShowAlert(true)
      }
    })

  }
}

function EventList() {
  const params = new URLSearchParams(useLocation().search);
  const [events, setEvents] = useState([])
  const history = useHistory();
  const [showModal, setShowModal] = useState(false)
  const [action, setAction] = useState("post")

  useEffect(() => {
    console.log(params.has("user_id"))
    if (params.has("user_id") && params.get("user_id") !== undefined && params.get("user_id") !== "") {
      axios.get(`http://172.24.98.145:5000/users/${params.get("user_id")}/events`)
        .then(res => setEvents(res.data))
    }
    else {
      history.push("/")
    }
  })
  function remove(event_id) {
    axios.delete(`http://172.24.98.145:5000/users/${params.get("user_id")}/events/${event_id}`)
      .then(() => window.location.reload())
  }
  return (<div className="resultList">
    <Modal show={showModal} centered onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{action === "post" ? "Agregar un Evento" : "Editar Evento"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="vertical-form">
          <label>
            Nombre:
          </label>
          <input placeholder="Ingrese el nombre del evento" type="text"></input>
          <label>
            Dirección:
          </label>
          <input placeholder="Ingrese la dirección del evento" type="text"></input>
          <label>
            Ubicación:
          </label>
          <input placeholder="Ingrese la ubicación del evento" type="text"></input>
          <label>
            Virtual:
          <input type="checkbox"></input>
          </label>
          <label>
            Categoria:
            <select>
              <option value="Conferencia">
                Conferencia
              </option>
              <option value="Seminario">
                Seminario
              </option>
              <option value="Congreso">
                Congreso
              </option>
              <option value="Curso">
                Curso
              </option>
            </select>
          </label>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <div className="controls">
          <div></div>
          <button className="primary" onClick={() => { setAction("post"); setShowModal(true) }}>
            Aceptar
      </button>
          <div></div>
          <button className="secondary" onClick={() => { setShowModal(false) }}>
            Cancelar
      </button>
        </div>
      </Modal.Footer>
    </Modal>
    <div className="controls">
      <div></div>
      <button className="primary" onClick={() => { setAction("post"); setShowModal(true) }}>
        Agregar Evento
      </button>
      <div></div>
      <button className="secondary" onClick={() => { }}>
        Cerrar Sesión
      </button>
    </div>
    {events.map((v) => {
      return (<div className="result">
        <h2>{v.name}</h2>
        <p><strong>Ubicación: </strong> {v.address}, {v.location}</p>
        <p><strong>Categoría: </strong> {v.category}</p>
        <p><strong>Inicio: </strong>{v.start_date} <strong>Fin: </strong>{v.finish_date}</p>
        <p><strong>Modalidad: </strong>{v.virtual ? "Virtual" : "Presencial"}</p>
        <div className="controls small">
          <div></div>
          <button className="primary" onClick={() => { setAction("put"); setShowModal(true) }}>
            Editar
      </button>
          <div></div>
          <button onClick={() => remove(v.id)} className="secondary">
            Eliminar
      </button>
        </div>
      </div>)
    })}
    {!events.length ? <div>No hay eventos</div> : <div />}
  </div>)
}
export default App;
