import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'

function TodoDetail(props) {

  let {id} = useParams()
  let navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const {handleDelete, user} = props

  useEffect(() => {
    console.log('Detail Did Mount Effect')
    axios.get(`http://localhost:5005/api/todos/${id}`, {withCredentials: true})
      .then((response) => {
        setDetail(response.data)
      })
      .catch((err) => {
        console.log('Error while getting todos', err)
      })
  }, [])

  console.log('Detail Render')
  if(!user){
    return navigate('/signin')
  }


  if(!detail){
    return  <Spinner animation="border" variant="primary" />
  }

 

  return (
    <div>
      <h2>{detail.name}</h2>
      <h5>{detail.description}</h5>
      <img src={detail.image} />
      <Link to={`/todo/${id}/edit`}>
        <Button variant="primary">
          Edit
        </Button>
      </Link>
      <Button variant="danger" onClick={() => {handleDelete(id) }}>Delete</Button>
    </div>
  )
}

export default TodoDetail