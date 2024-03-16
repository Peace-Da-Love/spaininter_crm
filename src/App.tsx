import { Router } from "@/app/router";
import { Provider } from "@/app/provider";

const App = () => {
	return (
		<Provider>
			<Router />
		</Provider>
	);
};

export default App;
