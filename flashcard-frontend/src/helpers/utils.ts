import axiosInstance from "./axiosInstance";

import { GroupData, GroupSearchData, UserIdMapping } from "./types";


export const fetchGroupData = async (groupId: string): Promise<GroupData> => {
    const response = await axiosInstance.get(`/groups/${groupId}`);
    if (response.status !== 200) {
        throw new Error("Failed to fetch group");
    }
    return response.data;
};

export const fetchUserDetails = async (userIds: Array<string> | Set<string>): Promise<UserIdMapping> => {
    if (userIds instanceof Set) {
        userIds = Array.from(userIds)
    }
    const response = await axiosInstance.post("/user/details", { user_ids: userIds });
    if (response.status !== 200) {
        throw new Error("Failed to fetch user details");
    }
    return response.data;
};

export const searchGroupData = async (groupName: string): Promise<Array<GroupSearchData>> => {
    const response = await axiosInstance.get(`/groups/search?group_name=${groupName}`);
    if (response.status !== 200) {
        throw new Error("Failed to search for group");
    }
    return response.data;
}

export const joinGroup = async (group_id: string): Promise<string> => {
    const response = await axiosInstance.post(`/groups/${group_id}/join`);
    if (response.status !== 200) {
        throw new Error("Failed to join group")
    }
    return response.data.message
}

export const leaveGroup = async (group_id: string): Promise<string> => {
    const response = await axiosInstance.post(`/groups/${group_id}/leave`);
    if (response.status !== 200) {
        throw new Error("Failed to leave group")
    }
    return response.data.message
}
