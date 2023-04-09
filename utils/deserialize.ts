const deserialize = <T>(data: string | T): T => {
    try {
        return JSON.parse(data as string) as T;
    } catch (e) {
        return data as T;
    }
};


export { deserialize };