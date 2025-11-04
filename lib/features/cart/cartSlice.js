import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const loadCartFromStorage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : { total: 0, cartItems: {} }
  }
  return { total: 0, cartItems: {} }
  
}

const saveCartToStorage = (cart) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart))
  }
}

let debounceTimer = null

export const uploadCart = createAsyncThunk('cart/uploadCart', 
    async (thunkAPI) => {
        try {
            clearTimeout(debounceTimer)
            debounceTimer = setTimeout(async ()=> {
                const { cartItems } = thunkAPI.getState().cart;
                await axios.post('/api/cart', {cart: cartItems})
            },1000)
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)

export const fetchCart = createAsyncThunk('cart/fetchCart', 
    async (thunkAPI) => {
        try {
            const { data } = await axios.get('/api/cart')
            return data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)


const cartSlice = createSlice({
    name: 'cart',
    initialState: loadCartFromStorage(),
    reducers: {
        addToCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]++
            } else {
                state.cartItems[productId] = 1
            }
            state.total = Object.values(state.cartItems).reduce((acc, quantity) => acc + quantity, 0)
            saveCartToStorage(state)
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total -= 1
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    },
    extraReducers: (builder)=>{
        builder.addCase(fetchCart.fulfilled, (state, action)=>{
            state.cartItems = action.payload.cart
            state.total = Object.values(action.payload.cart).reduce((acc, item)=>acc + item, 0)
        })
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions

export default cartSlice.reducer
