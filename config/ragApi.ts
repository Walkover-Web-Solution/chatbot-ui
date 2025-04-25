import axios from "@/utils/interceptor";
const URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createKnowledgeBaseEntry = async (data: any) => {
    try {
        const response = await axios.post(`${URL}/rag`, data);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
};

export const getAllKnowBaseData = async () => {
    try {
        const response = await axios.get(`${URL}/rag/docs`);
        return response?.data;
    } catch (error) {
        console.error(error);
        return error;
    }
};

export const deleteKnowBaseData = async (data: any) => {
    try {
        const { id } = data;
        const response = await axios.delete(`${URL}/rag/docs/${id}`, {
            data: { id },
        });
        return response?.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateKnowBaseData = async ({ id, data }: { id: string, data: any }) => {
    try {
        const response = await axios.patch(`${URL}/rag/docs/${id}`, data);
        return response?.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};