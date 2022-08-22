import Header from './Header';
import Nav from './Nav';
import Footer from './Footer';
import Home from './Home';
import NewPost from './NewPost';
import PostPage from './PostPage';
import EditPost from './EditPost';
import About from './About';
import Missing from './Missing';
import { Route, Switch, useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from './api/posts';

function App() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const history = useHistory();


  // get data effect
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // axios automaticly definds json and we dont need to do it
        // axios automaticly catchs errors when they are not 200 responeses    
        const response = await api.get('/posts');
        setPosts(response.data); 

        // if you are not sure about data comming
        //  u can do this chicking for sure
        // * if(response && response.data) setPosts(response.data); 
        
      } catch (err) {
        if (err.response) {
          // Not in the 200 response range \
          // u will get response if its not 200
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else {
          // write any message in backend  and put it here it's optional
          console.log(`Error: ${err.message}`);
        }
      }
    }

    fetchPosts();
  }, [])

  useEffect(() => {
    const filteredResults = posts.filter((post) =>
      ((post.body).toLowerCase()).includes(search.toLowerCase())
      || ((post.title).toLowerCase()).includes(search.toLowerCase()));

    setSearchResults(filteredResults.reverse());
  }, [posts, search])


  // create post
  const handleSubmit = async (e) => {
    e.preventDefault();
    // create id
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
    // create time
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const newPost = { id, title: postTitle, datetime, body: postBody };
    try {
      //send data
      // adress where to post and new obj what to post
      const response = await api.post('/posts', newPost);
      //updata data
      const allPosts = [...posts, response.data];
      setPosts(allPosts);
      setPostTitle('');
      setPostBody('');
      //go back to actial post
      history.push('/');
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }

  const handleEdit = async (id) => {
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const updatedPost = { id, title: editTitle, datetime, body: editBody };
    try {
      const response = await api.put(`/posts/${id}`, updatedPost);
      setPosts(posts.map(post => post.id === id ? { ...response.data } : post));
      setEditTitle('');
      setEditBody('');
      history.push('/');
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      const postsList = posts.filter(post => post.id !== id);
      setPosts(postsList);
      history.push('/');
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }

  return (
    <div className="App">
      <Header title="React JS Blog" />
      <Nav search={search} setSearch={setSearch} />
      <Switch>
        <Route exact path="/">
          <Home posts={searchResults} />
        </Route>
        <Route exact path="/post">
          <NewPost
            handleSubmit={handleSubmit}
            postTitle={postTitle}
            setPostTitle={setPostTitle}
            postBody={postBody}
            setPostBody={setPostBody}
          />
        </Route>
        <Route path="/edit/:id">
          <EditPost
            posts={posts}
            handleEdit={handleEdit}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editBody={editBody}
            setEditBody={setEditBody}
          />
        </Route>
        <Route path="/post/:id">
          <PostPage posts={posts} handleDelete={handleDelete} />
        </Route>
        <Route path="/about" component={About} />
        <Route path="*" component={Missing} />
      </Switch>
      <Footer />
    </div>
  );
}

export default App;
