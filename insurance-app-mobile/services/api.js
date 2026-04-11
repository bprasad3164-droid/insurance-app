import axios from "axios";

export default axios.create({
  baseURL: "http://127.0.0.1:8000/api" // Use localhost for now, user suggested custom domain for prod
});
