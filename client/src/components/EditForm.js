import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { Spinner, Button } from 'react-bootstrap'
import { useParams } from 'react-router-dom'

function EditForm(props) {

  let {id} = useParams()

  const [detail, setDetail] = useState(null)
  const {handleEdit} = props

  useEffect(() => {
    axios.get(`http://localhost:5005/api/todos/${id}`, {withCredentials: true})
      .then((response) => {
        setDetail(response.data)
      })
      .catch((err) => {
        console.log('Error while getting todos', err)
      })
  }, [])

  function handleChange(event){
    setDetail({...detail, [event.target.name]: event.target.value})
  }

  function onEdit(event){
    event.preventDefault()
    handleEdit(id, detail)
  }

  if(!detail){
    return  <Spinner animation="border" variant="primary" />
  }

  return (
    <form onSubmit={onEdit}>
      <input  name="name"  type="text" defaultValue={detail.name}  onChange={handleChange}/>
      <input  name="description"  type="text" defaultValue={detail.description} onChange={handleChange}/>
      <Button  type="submit"  >Submit</Button>
  </form>
  )
}

export default EditForm