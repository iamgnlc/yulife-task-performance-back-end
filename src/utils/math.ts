export const random = (min: number, max: number) => {
    const randomNum = Math.random() * (max - min) + min;
    return Math.floor(randomNum);
};
