import {useEffect, useState} from 'react';

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

function Home() {
  const [user, setUser] = useState({});

  function handleCallbackResponse(response) {
    let userObject = parseJwt(response.credential);
    setUser(userObject);
    console.log(userObject);
    document.getElementById("signInDiv").hidden = true;
  }

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "330635268733-eort9udoi6cnj3bjq92gq7ni6q8ak6po.apps.googleusercontent.com",
      callback: handleCallbackResponse
    })

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      {theme: "outline", size: "large"}
    )

    document.getElementById("signInDiv").hidden = !user;
  }, [])

  return (
    <div className="App">
      <div id="signInDiv"></div>
      { user &&
        <div>
          <img src={user.picture}></img>
          <h3>{user.name}</h3>
        </div>
      }
    </div>
  );
}

export default Home;
