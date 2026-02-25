import axios from "axios";

export const fetchGuides = async () => {
  const res = await axios.get("http://localhost:3000/api/admin-guides");
  return res.data.data;
};

export const deleteGuide = async (id:number) => {
 return axios.patch(`http://localhost:3000/api/admin-guides/${id}/deactivate`);
};

export const reactivateGuide = async (id: number) => {
  return axios.patch(`http://localhost:3000/api/admin-guides/${id}/reactivate`);
};


