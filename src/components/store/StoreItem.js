import {useEffect, useState} from 'react';

function StoreItem({name="", description="", cost=0, amount=0, retrieval_method="", unit="", vendor=""}) {
  return (
    <div class="StoreItem">
      <h2>{name}</h2>
      <h3>vendor: {vendor}</h3>
      <p>Cost per {unit}: ${cost}</p>
      <p>description: {description}</p>
      <p>Retrieval Method: {retrieval_method}</p>
      <p class={`${amount === 0? "StockNone" : "StockExists"}`}>{amount === 0? "Out of Stock" : `In Stock (${amount} left)`}</p>
    </div>
  );
}

export default StoreItem;