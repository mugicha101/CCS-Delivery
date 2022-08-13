import {useContext, useEffect, useState} from 'react';
import { Divider, Grid, Button } from "@mui/material";

import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { UserContext } from '../../contexts/UserContext';

import placeholderImage from '../../assets/images/placeholder.jpg'

function StoreItem({updateData, id="", name="", description="", cost=0, amount=0, retrieval_method="", unit="", vendor=""}) {
  const addToCart = httpsCallable(useContext(UserContext).functions, 'addToCart');

  return (
<Grid item xs={12} sm={6} md={4}>
    <div class="storeItem">
      <img src={placeholderImage}/>
      <div class="storeItemContent">
        <div class="itemInfo">
          <h2>{name}</h2>
          <div class="itemSubheading">
            <p><b><em>{vendor.toUpperCase()}</em></b></p>
            <div style={{flexGrow: 1}}/>
            <div>
              <p style={{display: "inline"}}><b>${cost}</b></p>
              <p class={`${amount === 0? "stockNone" : "stockExists"}`}>
                {amount === 0? " (Out of Stock)" : ` (${amount} left)`}
              </p>
            </div>

          </div>
          <Divider/>
          <p>{description}</p>
        </div>
        <div style={{flexGrow: 1, padding: 0}}/>
        <div>
          {/* <p>Retrieval Method: {retrieval_method}</p> */}
          <Button 
            variant="contained"
            fullWidth
            disabled={amount===0} 
            sx={{
              backgroundColor: "var(--quinary)",
              ":hover": {
                backgroundColor: "var(--quaternary)"
              }
            }}
            onClick={(e) => {
              addToCart({id: id, amount: 1, relative: true}).then(async (e) => {
                updateData();
              });
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  </Grid>
  );
}

export default StoreItem;