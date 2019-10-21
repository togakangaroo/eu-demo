import React from 'react'
import styled from 'styled-components'

const preventDefault = e => e.preventDefault()

const Form = styled.form``
export const SemanticForm = (props) => React.createElement(Form, {onSubmit: preventDefault, ...props})
