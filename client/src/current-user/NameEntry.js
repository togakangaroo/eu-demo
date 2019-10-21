import React, {useState} from 'react'
import {navigate} from '@reach/router'
import {Labeled} from '../ui/Labeled.js'
import {SemanticForm} from '../ui/SemanticForm.js'


export const NameEntry = () => {
    const [name, setName] = useState(``)
    const go = () => {
        if(!name.trim())
            return
        navigate(`/${name}`)
    }
    return (
        <article>
          <SemanticForm>
            <Labeled label="Enter username">
              <input onChange={e => setName(e.target.value)} required />
            </Labeled>
          </SemanticForm>
          <button onClick={go}>Go</button>
        </article>
    )
}
