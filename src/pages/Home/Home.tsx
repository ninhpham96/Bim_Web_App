import { Button } from "flowbite-react"
import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div className="relative h-full w-full flex justify-center items-center">
      <div>
        <h1 className="text-5xl text-gray-800">Welcome to My Platform</h1>
        <Link to="/project">
          <Button color="blue" className="mx-auto my-3">Get Started</Button>
        </Link>
      </div>
    </div>
  )
}
export default Home
