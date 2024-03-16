import { create } from "zustand";

type User = {
	isAuth: boolean;
	isLoading: boolean;
};

type UserStore = {
	user: User;
	setIsAuth: (isAuth: boolean) => void;
	setIsLoading: (isLoading: boolean) => void;
};

export const useUserStore = create<UserStore>(set => ({
	user: {
		isAuth: false,
		isLoading: true
	},
	setIsAuth: (isAuth: boolean) =>
		set(state => ({ user: { ...state.user, isAuth } })),
	setIsLoading: (isLoading: boolean) =>
		set(state => ({ user: { ...state.user, isLoading } }))
}));
