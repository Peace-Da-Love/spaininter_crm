import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/home";
import { PageLayout } from "@/shared/ui/layouts/page-layout";
import { AuthPage } from "@/pages/auth";
import { AuthRoute } from "./privat-routes";
import { LoginPage } from "@/pages/login";
import { PanelLayout } from "@/widgets/panel-layout/view.tsx";
import { NewsPage } from "@/pages/news";
import { CreateNewsPage } from "@/pages/create-news";
import { AdminsPage } from "@/pages/admins";
import { NotFoundPage } from "@/pages/not-found";
import { CategoriesPage } from "src/pages/categories";
import { CreateCategoryPage } from "@/pages/create-category";
import { EditCategoryPage } from "@/pages/edit-category";
import { EditNewsPage } from "@/pages/edit-news";
import { ChannelsPage } from "@/pages/channels";

export const Router = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<PageLayout />}>
					<Route element={<AuthRoute />}>
						<Route element={<PanelLayout />}>
							<Route path={"/"} element={<HomePage />} />
							<Route path={"/news"} element={<NewsPage />} />
							<Route path={"/news/:id"} element={<EditNewsPage />} />
							<Route path={"/create-news"} element={<CreateNewsPage />} />
							<Route path={"/admins"} element={<AdminsPage />} />
							<Route path={"/categories"} element={<CategoriesPage />} />
							<Route
								path={"/create-category"}
								element={<CreateCategoryPage />}
							/>
							<Route path={"/category/:id"} element={<EditCategoryPage />} />
							<Route path={"/channels"} element={<ChannelsPage />} />
						</Route>
					</Route>
					<Route path={"/auth"} element={<AuthPage />} />
					<Route path={"/login"} element={<LoginPage />} />
					<Route path={"*"} element={<NotFoundPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
