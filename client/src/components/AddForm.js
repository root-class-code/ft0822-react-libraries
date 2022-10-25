import {Button} from  'react-bootstrap'

function AddForm({handleAddTodo}){

	return (
		<form onSubmit={handleAddTodo}  enctype="multipart/form-data">
			<input  name="name"  type="text"  placeholder="Enter name"/>
			<input  name="description"  type="text"  placeholder="Enter desc"/>
			<input type="file" name="imageUrl" accept="image/png, image/jpg" />
			<Button  type="submit"  >Submit</Button>
		</form>
	)
}

export default AddForm