import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchAddress = createAsyncThunk('address/fetchAddress', 
    async (thunkAPI) => {
        try {
            const { data } = await axios.get('/api/address')
            return data ? data.addresses : []
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
    },
    reducers: {
        addAddress: (state, action) => {
            state.list.push(action.payload)
        },
    },
    extraReducers: (builder)=>{
        builder.addCase(fetchAddress.fulfilled, (state, action)=>{
            state.list = action.payload
        })
    }
})

export const { addAddress } = addressSlice.actions

export default addressSlice.reducer