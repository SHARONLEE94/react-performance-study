import React from 'react'

const Message = ({message}) => {
  return <p>{message}</p>
}

const ListItem = ({post}) => {
  return (
    <li key={post.id}>
      <p>{post.title}</p>
    </li>
  )
}

const List = ({posts}) => {
  return (
    <ul>
      {posts.map(post => 
        <ListItem key={post.id} post = {post}/>
      )}
    </ul>
  )
}

// 여러 컴포넌트 나눠주기
const B = ({message, posts}) => {
  return (
    <div style={{marginLeft:'50px'}}>
      <h1>B component</h1>
      < Message message={message}/>
      < List posts={posts}/>
    </div>
  )
}

export default B
