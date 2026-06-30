import * as repository from "./user.repository";

export const createUser = async (
    name: string,
    email: string
) => {
    return repository.createUser({
        name,
        email
    });
};

export const getUsers = async () => {
    return repository.getUsers();
};

export const deleteUser = async (
    id: number
) => {
    return repository.deleteUser(id);
};