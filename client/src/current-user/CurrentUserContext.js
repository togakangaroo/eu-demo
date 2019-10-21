import React, {useContext} from 'react'
export const CurrentUserContext = React.createContext(null)
export const useCurrentUser = () => useContext(CurrentUserContext)
