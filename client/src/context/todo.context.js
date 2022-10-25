import { createContext, useState } from "react";

let AppContext = createContext()

function AppContextWrapper(props){

    const [school, setSchool] = useState('RootLearn')

    return (
        <AppContext.Provider value={{school, setSchool}}>
            {props.children}
        </AppContext.Provider>
    )
}

export {AppContext, AppContextWrapper}