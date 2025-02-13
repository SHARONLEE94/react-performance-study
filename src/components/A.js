import React from 'react'

// 모든 요소를 하나의 컴포넌트에
const A = ({message, posts}) => {
  return (
    <div>
      <h1>A component</h1>
      <p>{message}</p>
      <ul>
        {posts.map(post => {
          return (
            <li key={post.id}>
              <p>{post.title}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default A
