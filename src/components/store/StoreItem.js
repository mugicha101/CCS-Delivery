import {useContext, useEffect, useState} from 'react';
import { Grid } from "@mui/material";

import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { UserContext } from '../../contexts/UserContext';

function StoreItem({updateData, id="", name="", description="", cost=0, amount=0, retrieval_method="", unit="", vendor=""}) {
  const addToCart = httpsCallable(useContext(UserContext).functions, 'addToCart');

  return (
<Grid item xs={12} sm={6} md={4}>
    <div class="StoreItem">
      <h2>{name}</h2>
      <h3>vendor: {vendor}</h3>
      <p>Cost per {unit}: ${cost}</p>
      <p>description: {description}</p>
      <p>Retrieval Method: {retrieval_method}</p>
      <p class={`${amount === 0? "stockNone" : "stockExists"}`}>{amount === 0? "Out of Stock" : `In Stock (${amount} left)`}</p>
      <button disabled={amount===0} onClick={(e) => {
        addToCart({id: id, amount: 1, relative: true}).then(async (e) => {
          console.log("update data");
          updateData();
        });
      }}>Add to Cart</button>
    </div>
  </Grid>
  );
}

export default StoreItem;