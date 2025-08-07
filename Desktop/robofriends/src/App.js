import React,{ useState,useEffect } from "react";
import CardList from "./CardList";
import SearchBox from "./SearchBox";
import 'tachyons'
//import Scroll from "./Scroll",

const App = () => {
  const [robots,setRobots] = useState([]);
  const [searchfield,setSearchfield] = useState('');

  useEffect(() => {
    const fetchRobots = async () => {
      try{
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const users = await response.json();
        setRobots(users);
      }catch (error){
        console.error('Error fetching robots:',error);
      }
    };
    fetchRobots();
  },[]);

const onSearchChange = (event) =>{
  setSearchfield(event.target.value);
};

const filteredRobots = robots.filter(robot=>
  robot.name.toLowerCase().includes(searchfield.toLowerCase())
  );

return(
  <div className="tc">
  <h1>Robofriends</h1>
  <SearchBox searchChange={onSearchChange}/>
  <CardList robots={filteredRobots} />
  {/*<scroll>*/}
  </div>

  );

};

export default App;