import { create } from "zustand";
import { IRole } from "@/app/types";

type User = {
	isAuth: boolean;
	isLoading: boolean;
	role: IRole | null;
};

type UserStore = {
	user: User;
	setIsAuth: (isAuth: boolean) => void;
	setIsLoading: (isLoading: boolean) => void;
	setRole: (role: IRole) => void;
};

export const useUserStore = create<UserStore>(set => ({
	user: {
		isAuth: false,
		isLoading: true,
		role: null
	},
	setRole: (role: IRole) => set(state => ({ user: { ...state.user, role } })),
	setIsAuth: (isAuth: boolean) =>
		set(state => ({ user: { ...state.user, isAuth } })),
	setIsLoading: (isLoading: boolean) =>
		set(state => ({ user: { ...state.user, isLoading } }))
}));
