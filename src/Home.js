import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTransition, animated } from 'react-spring'
import './home.css'

const Home = () => {
  const ref = useRef([])
  const [items, set] = useState([])
  const transitions = useTransition(items, null, {
    from: { opacity: 0, height: 0, innerHeight: 0, transform: 'perspective(600px) rotateX(0deg)', color: '#8fa5b6' },
    enter: [
      { opacity: 1, height: 80, innerHeight: 80 },
      { transform: 'perspective(600px) rotateX(180deg)', color: '#28d79f' },
      { transform: 'perspective(600px) rotateX(0deg)' },
    ],
    leave: [{ color: '#c23369' }, { innerHeight: 0 }, { opacity: 0, height: 0 }],
    update: { color: '#28b4d7' },
  })

  const reset = useCallback(() => {
    ref.current.map(clearTimeout)
    ref.current = []
    set([])
    ref.current.push(setTimeout(() => set(['Travel', 'Gluten', 'Free']), 2000))
    ref.current.push(setTimeout(() => set(['Gluten', 'Free']), 5000))
    ref.current.push(setTimeout(() => set(['Find me', 'Gluten', 'Free']), 8000))
  }, [])

  useEffect(() => void reset(), [])

  return (
    <Link to={'/map'} style={{ textDecoration: 'none', color:"transparent" }}>
    <div className="landing">
      {transitions.map(({ item, props: { innerHeight, ...rest }, key }) => (
        <animated.div className="transitions-item" key={key} style={rest} >
          <animated.div style={{ overflow: 'hidden', height: innerHeight }}>{item}</animated.div>
        </animated.div>
      ))}
    </div>
    </Link>   
  )
}
export default Home

