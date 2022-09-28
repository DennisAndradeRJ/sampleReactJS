import axios from 'axios';

export default axios.create({
    baseURL: 'http://idm.example.com:8080'
});
