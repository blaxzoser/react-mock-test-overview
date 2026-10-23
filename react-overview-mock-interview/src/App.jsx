import './App.css'
import PostList from './components/PostList';
import Header from './components/Hearder';
import { useState } from 'react';

function App() {

  const [modelIsVisible, setModelIsVisible ] = useState(false); 
     
  function hiddenModalHandler(){
    setModelIsVisible(false);
  }

  function showModalHandler(){
    setModelIsVisible(true);
  }

  return ( 
      <>
        <Header onCreatePost={showModalHandler}/>
         <main>
            <PostList 
                  isPosting={modelIsVisible} 
                  onStopPosting={hiddenModalHandler}/>
          </main>
      </>
  );
}

export default App
