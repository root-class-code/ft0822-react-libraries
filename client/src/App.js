import React, {useState, useEffect, useContext} from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import AddForm from "./components/AddForm";
import MyNav from "./components/MyNav";
import TodoList from "./components/TodoList";
import TodoDetail from "./components/TodoDetail";
import EditForm from "./components/EditForm";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import axios from "axios";
import { Alert, Spinner } from "react-bootstrap";
import {AppContext} from '../src/context/todo.context'
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from './components/CheckoutForm';
import PaymentStatus from "./components/PaymentStatus";
import MyMap from "./components/MyMap";
import GoogleButton from "./components/GoogleButton";
import { gapi } from "gapi-script";


function App() {

  const {setSchool}  = useContext(AppContext)

  const [todos, setTodos] = useState([])
  const [user, setUser] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [fetchingData, setFetchingData] = useState(true)
  const [error, setError] = useState(null)
  let navigate = useNavigate()

  // Will run just once after the component mounts
  useEffect(() => {
    console.log('Add Did Mount Effect')
    
    gapi.load("client:auth2", () => {
      gapi.client.init({
        clientId:
          "327001794885-l6v3vc6cevql303u8f3bkc5fv0bd2vv3.apps.googleusercontent.com",
        plugin_name: "chat",
      });
    });

    async function getData(){

      try {
        let stripeResponse = await axios.get('http://localhost:5005/api/secret')
        setClientSecret(stripeResponse.data.client_secret)


        let todoResponse = await axios.get('http://localhost:5005/api/todos', {withCredentials: true})
        setTodos(todoResponse.data)

        let response = await axios.get('http://localhost:5005/api/user', {withCredentials: true})  

        setUser(response.data)
        setFetchingData(false)
      }
      catch(err){
        setFetchingData(false)
      }
    }

    getData()
  }, [])

  // Redirects the user once the todos is updated
  useEffect(() => {
    console.log('User/todo Update Render')

    if (!fetchingData) {
      navigate('/')
    }
    
  }, [todos])
  
  
  async function handleAddTodo(event){
    event.preventDefault()
    const {name, description, imageUrl} = event.target

    const formData = new FormData();
    formData.append('imageUrl', imageUrl.files[0]);

    let imageResponse = await axios.post('http://localhost:5005/api/upload', formData)
 
    let response  = await axios.post('http://localhost:5005/api/create', {
      name: name.value,
      description: description.value,
      image: imageResponse.data.imageUrl
    })

    // we also need to add to our todos on the client side
    setTodos([response.data, ...todos])
    setSchool('RootLearn1')
  }

  async function handleDelete(id){
    await axios.delete(`http://localhost:5005/api/todos/${id}`, {withCredentials: true})

    let newTodos = todos.filter(todo => {
      return  todo._id !== id
    })
    setTodos(newTodos)
  }

  async function handleEdit(id, detail){
    let response = await axios.patch(`http://localhost:5005/api/todos/${id}`, detail, {withCredentials: true})

    let updatedTodos = todos.map((todo) => {
      if (todo._id == id) {
        todo.name = response.data.name;
        todo.description = response.data.description
      }
      return todo
    })
    console.log(updatedTodos)
    setTodos(updatedTodos)

  }

  async function handleSignUp(event){
    event.preventDefault()
    let user = {
      username: event.target.username.value, 
      email: event.target.email.value, 
      password: event.target.password.value, 
    }
    try {
      await axios.post('http://localhost:5005/api/signup', user, {withCredentials: true})
      navigate('/signin')
    }
    catch(err){
      setError(err.response.data.errorMessage)
    }
  }

  async function handleSignIn(event){
    event.preventDefault()
    let user = {
      email: event.target.email.value, 
      password: event.target.password.value, 
    }
    try {
      let response = await axios.post('http://localhost:5005/api/signin', user,{withCredentials: true})
      setUser(response.data)
    }
    catch(err){
      setError(err.response.data.errorMessage)
    }
   
  }

  async function handleLogOut(){
      await axios.get('http://localhost:5005/api/logout', {withCredentials: true})
      setUser(null)
  }

  const handleGoogleSuccess = (data) => {

    setFetchingData(true)
  
    const {givenName, familyName, email, imageUrl, googleId} = data.profileObj
    let newUser = {
      firstName: givenName,
      lastName: familyName,
      email,
      image: imageUrl,
      googleId
    }
  
    axios.post(`http:///localhost:5005/api/google/info`, newUser , {withCredentials: true})
      .then((response) => {
        setUser(response.data.data)
        setFetchingData(false)
      })
  }

  const handleGoogleFailure = (err) => {
    console.log(err)
  }

  if (fetchingData){
    return <Spinner animation="border" variant="primary" />
  }

  const stripePromise = loadStripe('pk_test_51LwfahSJXufRRU6t7bPH6XkEF2EiKAqF1upTQdPz9TYK5Dx6Ml9OAAIsCt43MlOGuggAw8f3N0GsENIvLsFgKpfN00Klq5AESL');
 
  const options = {
    // passing the client secret obtained in step 3
    clientSecret: clientSecret,
  };

  return (
    <div>
      <MyNav user={user} handleLogOut={handleLogOut} />
      <GoogleButton onSuccess={handleGoogleSuccess} onFailure={handleGoogleFailure}/>
      <MyMap />
      {
        error && (
          <Alert variant={"danger"}>
              {error}
              <span style={{marginLeft: '60px'}}onClick={() => {setError(null)}}>X</span>
          </Alert>
        )
      }
      <Routes>
        <Route path="/" element={<TodoList todos={todos}/>} />
        <Route path="/add-form" element={<AddForm handleAddTodo={handleAddTodo} />}/>
        <Route path="/todo/:id" element={<TodoDetail 
        handleDelete={handleDelete} user={user}/>}/>
        <Route path="/todo/:id/edit" element={<EditForm 
        handleEdit={handleEdit} />}/>
        <Route path="/signin" element={<SignIn
        handleSignIn={handleSignIn} />} />
        <Route path="/signup" element={<SignUp 
        handleSignUp={handleSignUp} />} />
        <Route path="/payment" element={
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm />
            </Elements>
        } />
         <Route path="/completed" element={
           <Elements stripe={stripePromise} options={options}>
              <PaymentStatus />
           </Elements>
        } />
      </Routes>
    </div>
  );
}

export default App;
