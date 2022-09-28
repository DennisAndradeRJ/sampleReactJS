import axios from 'axios';

export default axios.create({
    baseURL: 'http://am.example.com:8080/am'
});
