import NavContent from './NavContent';
import './NavBar.css';

function Dropdown() {
    return (<div id="dropdown">
        <ul id="dropdownList"><NavContent /></ul>
    </div>)
}

export default Dropdown;