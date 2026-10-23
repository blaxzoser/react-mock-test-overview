import classes from './AddPost.module.css';
import { useState } from 'react';

function AddPost({onCancel,onAddPost}){

    const [enteredBody, setEnteredBody] = useState('');
    const [enteredAuthor, setEnteredAuthor] = useState('');

    function bodyChangeHandler(event){
        setEnteredBody(event.target.value);
    }

    function authorChangeHandler(event){
        setEnteredAuthor(event.target.value);
    }

    function submitHandler(event){
        event.preventDefault();
        const postData ={
            body: enteredBody,
            author:enteredAuthor
        }
        console.log(postData);
        onAddPost(postData);
        onCancel();
    }

    return(
        <form className={classes.form} onSubmit={submitHandler}>
            <div>
                <p className={classes.field}>
                    <label className={classes.label} htmlFor="body">Text</label>
                    <textarea className={classes.input} id="body" required rows={3} onChange={bodyChangeHandler}></textarea>
                </p>
                <p className={classes.field}>
                    <label className={classes.label} htmlFor="name">Your name</label>
                    <input className={classes.input} type="text" id="name" required  onChange={authorChangeHandler}></input>
                </p>
                <p className={classes.actions}>
                    <button type='button' className={classes.cancel} onClick={onCancel}>Cancel</button>
                    <button type='submit' className={classes.submit}>Add</button>
                </p>
            </div>
        </form>
    );
}

export default AddPost;
