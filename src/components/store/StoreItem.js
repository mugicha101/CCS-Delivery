import {useContext, useEffect, useState} from 'react';
import { Grid } from "@mui/material";

import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { UserContext } from '../../contexts/UserContext';

import placeholderImage from '../../assets/images/placeholder.jpg'

function StoreItem({updateData, id="", name="", description="", cost=0, amount=0, retrieval_method="", unit="", vendor=""}) {
  const addToCart = httpsCallable(useContext(UserContext).functions, 'addToCart');

  return (
<Grid item xs={12} sm={6} md={4}>
    <div class="StoreItem">
      <img src={placeholderImage}/>
      <div class="StoreItemContent">
        <div>
          <h2>{name}</h2>
          <h4>{vendor}</h4>
          <p>description: {description}</p>
        </div>
        <div style={{flexGrow: 1, padding: 0}}/>
        <div>
          <p>Cost per {unit}: ${cost}</p>
          {/* <p>Retrieval Method: {retrieval_method}</p> */}
          <p class={`${amount === 0? "stockNone" : "stockExists"}`}>{amount === 0? "Out of Stock" : `In Stock (${amount} left)`}</p>
          <button disabled={amount===0} onClick={(e) => {
            addToCart({id: id, amount: 1, relative: true}).then(async (e) => {
              console.log("update data");
              updateData();
            });
          }}>Add to Cart</button>
        </div>
      </div>
    </div>
  </Grid>
  );
}

export default StoreItem;