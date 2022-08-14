import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import { Button, Grid, TextField } from "@mui/material";
import { httpsCallable } from "firebase/functions";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";

function CartItem({id, itemData, amount, updateData, waiting, setWaiting}) {
    const [formAmount, setFormAmount] = useState(amount);
    console.log(amount, formAmount)

    const addToCart = httpsCallable(useContext(UserContext).functions, 'addToCart');

    let formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    let getNum = (val) => {
        if (val === "") {
            return 1;
        }

        let num = parseInt(val);
        if (!Number.isInteger(num)) {
            return -1;
        }

        if (num < 1) {
            num = 1;
        }
        if (num > 99) {
            num = 99;
        }

        return num;
    }

    let handleAmount = async (val) => {
        setWaiting((prev) => prev+1);
        
        let newAmount = getNum(val);
        setFormAmount(newAmount);
        if (getNum !== -1) {
            await addToCart({id: id, amount: newAmount, relative: false});
            await updateData();
        }

        setWaiting((prev) => prev-1);
    }
  
    return (
        <Grid container key="itemData.name" columns={12} spacing={2}>
            <Grid item xs={6}>
                <div class="cartItemInfo">
                    <h4 title={itemData? itemData.name: "Removed Item"}>{itemData? itemData.name: "Removed Item"}</h4>
                    {itemData && <h5 title={itemData.vendor}><em>{itemData.vendor.toUpperCase()}</em></h5>}
                </div>
            </Grid>

            <Grid item xs={3}>
                <div class="itemCounter">
                    <Button 
                        variant="contained"
                        sx={{width: "25%", padding: 1, minWidth: 0, borderRadius: "4px 0 0 4px", borderRight: "none"}}
                        onClick={() => handleAmount(formAmount-1)}
                    >
                        <ArrowLeft/>
                    </Button>
                    <TextField 
                        sx={{
                            width: "50%", 
                            "fieldset": {
                                borderStyle: "solid none",
                                borderRadius: "0 0 0 0",
                                borderColor: "var(--primary)",
                                top: 0
                            },
                            "legend": {
                                display: "none"
                            },
                            "div": {
                                height: "100%"
                            }
                        }}
                        inputProps={{
                            sx: {
                                padding: 0,
                                height: "100%",
                                textAlign: "center"
                            }
                        }}
                        value={formAmount}
                        onChange={(e) => handleAmount(e.target.value)}
                    />
                    <Button 
                        variant="contained"
                        sx={{width: "25%", padding: 1, minWidth: 0, borderRadius: "0 4px 4px 0", borderLeft: "none"}}
                        onClick={() => handleAmount(formAmount+1)}
                    >
                        <ArrowRight/>
                    </Button>
                </div>
            </Grid>

            <Grid item xs={3} >
                <div class="itemPrice">
                    {itemData && 
                        <h4>
                            {formatter.format(itemData.cost * formAmount)}
                            <br />
                            {"(" + formatter.format(itemData.cost) + " ea.)"}
                        </h4>
                    }
                </div>
            </Grid>
            
            {/* {itemData && amount > itemData.amount && <p>WARNING: Order exceeds available stock</p>} */}
        </Grid>
    );
}

export default CartItem;