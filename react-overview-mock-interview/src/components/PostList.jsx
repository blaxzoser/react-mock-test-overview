import Post from './Post';
import AddPost from './AddPost';
import Modal from './Modal';
import classes from './PostList.module.css';
import { useState } from 'react';

function PostList({isPosting,onStopPosting}){
    const [posts,SetPosts] = useState([]);

    function AddPostHandler(postData){
        SetPosts((existingPost) => [postData, ...existingPost] );
    }
    return (
        <>
        { isPosting && 
            <Modal onClose={onStopPosting}>
                <AddPost  onCancel={onStopPosting} onAddPost={AddPostHandler} >                        
                </AddPost>
            </Modal>
        }
        {posts.length > 0 &&
         <ul className={classes.posts}>
            {
                posts.map((post, index) => <Post key={index} author={post.author} body={post.body} /> )
            }
            </ul>
        }
        {posts.length === 0 &&
            <div className={classes.empty}>
                <h2>There are no posts yet.</h2>
                <p>A long time ago, in a galaxy far, far away... start adding something.</p>
            </div>
        }
        </>
      );     
}

export default PostList;