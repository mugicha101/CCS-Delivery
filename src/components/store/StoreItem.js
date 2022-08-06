import {useEffect, useState} from 'react';

import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
connectFunctionsEmulator(functions, "localhost", 5001);
const addToCart = httpsCallable(functions, 'addToCart');

function StoreItem({id="", name="", description="", cost=0, amount=0, retrieval_method="", unit="", vendor=""}) {
  return (
    <div class="StoreItem">
      <h2>{name}</h2>
      <h3>vendor: {vendor}</h3>
      <p>Cost per {unit}: ${cost}</p>
      <p>description: {description}</p>
      <p>Retrieval Method: {retrieval_method}</p>
      <p class={`${amount === 0? "stockNone" : "stockExists"}`}>{amount === 0? "Out of Stock" : `In Stock (${amount} left)`}</p>
      <button disabled={amount===0} onClick={(e) => {addToCart({id: id})}}>Add to Cart</button>
    </div>
  );
}

export default StoreItem;