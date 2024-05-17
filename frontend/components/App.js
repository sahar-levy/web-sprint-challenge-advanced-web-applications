import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => navigate('/login') 
  const redirectToArticles = () => navigate('/articles')

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    localStorage.removeItem('token')
    // and a message saying "Goodbye!" should be set in its proper state.
    setMessage('Goodbye!')
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    redirectToLogin()
  }

  const login = ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    setMessage('')
    setSpinnerOn(true)
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    username = username.trim()
    password = password.trim()

    if (username.length >= 3 && password.length >= 8) {
      fetch(loginUrl, {
        method: 'POST',
        body: JSON.stringify({ 
          username, 
          password 
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('An error occured')
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem('token', data.token)
        setMessage(data.message)
        redirectToArticles()
        setSpinnerOn(false)
      })
      .catch(error => {
        setMessage(error.message)
        setSpinnerOn(false)
      })
    }
  }

  const getArticles = () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    const token = localStorage.getItem('token')

    setMessage('')
    setSpinnerOn(true)

    fetch(articlesUrl, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    .then(res => {
      if (res.status === 401) {
        throw new Error('Authentication failed. Please try again.')
      }
      if (!res.ok) {
        throw new Error('Failed to fetch articles')
      }
      return res.json()
    })
    .then(data => {
      setArticles(data.articles)
      setMessage(data.message)
      setSpinnerOn(false)
    })
    .catch(err => {
      if (err.message.includes('Authentication failed')){
        redirectToLogin()
      }
      setSpinnerOn(false)
    })
  }

  const postArticle = article => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.

    if (article.title.trim().length === 0 || article.text.trim().length === 0) {
      return setMessage("Title and text must contain at least one character.");
    }
  

    setMessage('')
    setSpinnerOn(true)

    const token = localStorage.getItem('token')
    if (!token) {
      return setMessage('No token, try again')
    }

    axios.post(articlesUrl, article, {
      headers: {
        'Authorization': token
      }
    }) 
      .then(res => {
        console.log(res)
        setArticles(prevArticle => [...prevArticle,res.data.article])
        setMessage(res.data.message)
        setSpinnerOn(false)
      })
      .catch(err => {
        console.log(err.message)
        setMessage(err.message)
        setSpinnerOn(false)
      })
  }

  const updateArticle = ({ article_id, article }) => {
    // ✨ implement
    // You got this!
    setMessage('')
    setSpinnerOn(true)

    const token = localStorage.getItem('token')
    if (!token) {
      return setMessage('No token, try again')
    }


  }

  const deleteArticle = article_id => {
    // ✨ implement
    setMessage('')
    setSpinnerOn(true)

    const token = localStorage.getItem('token')
    if (!token) {
      return setMessage('No token, try again')
    }
  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn}/>
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm postArticle={postArticle} updateArticle={updateArticle} setCurrentArticleId={setCurrentArticleId} />
              <Articles articles={articles} getArticles={getArticles} deleteArticle={deleteArticle} setCurrentArticleId={setCurrentArticleId} />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}
