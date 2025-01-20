import { useEffect, useState } from 'react'
export function App() {
  const [state, setState] = useState(0)
  useEffect(() => {
    console.log('state', state)
  }, [])

  return (
    <div>
      <div>hello</div>
    </div>
  )
}
