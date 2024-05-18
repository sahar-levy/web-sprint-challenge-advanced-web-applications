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
  const redirectToLogin = () => navigate('/') 
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

      axios.post(loginUrl, {username, password})
      .then(res => {
        window.localStorage.setItem('token', res.data.token)
        setMessage(res.data.message)
        redirectToArticles()
        setSpinnerOn(false)
      })
      .catch(error => {
        setMessage(error.data.message)
        setSpinnerOn(false)
      })
  }

  const getArticles = () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    const token = localStorage.getItem('token')

    setMessage('')
    setSpinnerOn(true)

    axios.get(articlesUrl, {
      headers: {
        'Authorization': token
      }
    })
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    
    .then(res => {
      setArticles(res.data.articles)
      setMessage(res.data.message)
      setSpinnerOn(false)
    })
    .catch(err => {
      redirectToLogin()
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
        setArticles(prevArticle => [...prevArticle,res.data.article])
        setMessage(res.data.message)
        setSpinnerOn(false)
      })
      .catch(err => {
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
      setSpinnerOn(false)
      return setMessage('No token, try again')
    }

    if (!article.title.trim() || !article.text.trim() || !['React', 'JavaScript', 'Node'].includes(article.topic)) {
      setSpinnerOn(false);
      return setMessage('Validation error: Check title, text, and topic.');
    }

    axios.put(`${articlesUrl}/${article_id}`, article, {
      headers: {
          'Authorization': token
      }
    })
    .then(response => {
        if (response.status === 200) {
            setArticles(prevArticles =>
                prevArticles.map(art => art.article_id === article_id ? response.data.article : art)
            );
            setMessage(response.data.message || 'Article updated successfully!');
        } else {
            throw new Error('Unexpected server response.');
        }
        setSpinnerOn(false);
    })
    .catch(error => {
        console.error('Update article error:', error);
        setMessage(error.response ? error.response.data.message : 'Failed to update article');
        setSpinnerOn(false);
    });
  }

  const deleteArticle = article_id => {
    // ✨ implement
    // setMessage('');
    // setSpinnerOn(true);

    // const token = localStorage.getItem('token');
    // if (!token) {
    //     setSpinnerOn(false);
    //     return setMessage('Authentication required. Please log in.');
    // }

    // axios.delete(`${articlesUrl}/${article_id}`, {
    //     headers: {
    //         'Authorization': token
    //     }
    // })
    // .then(response => {
    //     setArticles(prevArticles => prevArticles.filter(art => art.article_id !== article_id));
    //     setMessage(response.data.message);
    //     setSpinnerOn(false);
    // })
    // .catch(error => {
    //     console.error('Delete article error:', error);
    //     setMessage(error.response.data.message);
    //     setSpinnerOn(false);
    // });
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
          <Route exact path="/" element={<LoginForm login={login} />} />
          <Route path="/articles" element={
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
