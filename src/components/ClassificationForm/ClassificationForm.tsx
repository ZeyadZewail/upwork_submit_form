import {
	Alert,
	Box,
	Button,
	MenuItem,
	Paper,
	Table,
	TableRow,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { render } from "react-dom";
import { useForm } from "react-hook-form";

type Classification =
	| ""
	| "id"
	| "name"
	| "email"
	| "phone"
	| "zip"
	| "city"
	| "birth"
	| "street"
	| "ussocialsec"
	| "ip4address"
	| "creditcard"
	| "germandriverlicense"
	| "germanphone"
	| "germaniban"
	| "germanlicenseplate"
	| "germancellphone"
	| "germanbanknr";

interface Column {
	name: string;
	classification: Classification;
	mostFrequentValue: string;
	maximumValue: string;
	minimumValue: string;
	datatype: string;
}

const ClassificationForm = () => {
	const [columns, setColumns] = useState<Column[]>([]);
	const [fileName, setFileName] = useState<string>("Choose File");
	const [tick, setTick] = useState<Boolean>();
	const [error, setError] = useState("");

	const {
		register,
		setValue,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>();

	const onFileChange = (selectorFiles: FileList) => {
		setFileName(selectorFiles[0].name);
	};

	const onSubmit = handleSubmit((data: any) => {
		fileUpload(data);
	});

	const handleChange = (i: number, e: SelectChangeEvent) => {
		columns[i].classification = e.target.value as Classification;
		console.log(columns[i].classification);
		setTick(!tick);
	};

	const fileUpload = async (data: any) => {
		if (!data.file[0]) {
			return;
		}
		const formData = new FormData();
		formData.append("file", data.file[0]);

		const response = await fetch(
			"https://pseudo-api.datafortress.cloud/uploadfile",
			{
				method: "POST",
				body: formData,
			}
		);

		if (!response.ok) {
			setError("API error");
			return;
		}

		const responseData = await response.json();
		const columns: Column[] = [];
		for (let i in responseData) {
			if (responseData[i].classification != null) {
				responseData[i].classification = responseData[i]
					.classification as Classification;
			} else {
				responseData[i].classification = "";
			}

			const temp: Column = { name: i, ...responseData[i] };
			columns.push(temp as Column);
		}
		setColumns(columns);
	};

	const postUpdate = async () => {
		let postBody = {};
		for (let i = 0; i < columns.length; i++) {
			const name: string = columns[i].name;
			postBody = {
				...postBody,
				[name]: {
					classification: columns[i].classification ?? "",
					mostFrequentValue: columns[i].mostFrequentValue ?? "",
					maximumValue: columns[i].maximumValue ?? "",
					minimumValue: columns[i].minimumValue ?? "",
					datatype: columns[i].datatype ?? "",
				},
			};
		}

		const requestOptions = {
			method: "POST",
			cors: "no-cors",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(postBody),
		};
		let response = await fetch(
			"https://pseudo-api.datafortress.cloud/updatefile",
			requestOptions
		);
		console.log(await response.json());
	};

	const generateRows = (columns: Column[]) => {
		const content = [];
		for (let i = 0; i < columns.length; i++) {
			const row = [];
			row.push(<TableCell>{columns[i].name}</TableCell>);
			row.push(
				<TableCell>
					<Select
						value={columns[i].classification}
						MenuProps={{
							disableScrollLock: true,
						}}
						sx={{ width: "100%", backgroundColor: "white" }}
						onChange={(e) => {
							handleChange(i, e);
						}}>
						{renderOptions()}
					</Select>
				</TableCell>
			);
			row.push(<TableCell>{columns[i].mostFrequentValue}</TableCell>);
			row.push(<TableCell>{columns[i].maximumValue}</TableCell>);
			row.push(<TableCell>{columns[i].minimumValue}</TableCell>);
			const color = columns[i].classification === "" ? "inherit" : "#ed9090";
			content.push(<TableRow sx={{ backgroundColor: color }}>{row}</TableRow>);
		}
		return content;
	};

	return (
		<Box
			sx={{
				height: "100%",
				width: "100%",
				display: "flex",
				justifyContent: "start",
				alignItems: "start",
				color: "black",
			}}>
			<Box
				sx={{
					border: "1px solid black",
					borderRadius: "25px",
					padding: 4,
					height: "fit-content",
					margin: 4,
					display: "flex",
					flexDirection: "column",
					gap: 2,
					backgroundColor: "white",
					width: "100%",
					minHeight: "100%",
				}}>
				<Typography variant="h3" sx={{ textAlign: "center" }}>
					Classification Form
				</Typography>
				<Box sx={{ display: "flex", justifyContent: "center" }}>
					<form onSubmit={onSubmit}>
						<Button
							variant="contained"
							component="label"
							sx={{ width: "fit-content" }}>
							{fileName}
							<input
								hidden
								// @ts-ignore
								{...register("file", {
									required: true,
									onChange: (e) => onFileChange(e.target.files),
								})}
								type="file"
								accept=".csv,.json,.xlsx,.xls,.parquet"
							/>
						</Button>
						<Button type="submit">Upload</Button>
					</form>
				</Box>
				{error ? <Alert severity="error">{error}</Alert> : null}
				<TableContainer component={Paper} sx={{}}>
					<Table>
						<TableHead>
							<TableCell sx={{ fontWeight: "bold" }}>Column Name</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Classification</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>
								Most Frequent Value
							</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Max</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Min</TableCell>
						</TableHead>
						<TableBody>{generateRows(columns)}</TableBody>
					</Table>
				</TableContainer>
				<Button
					sx={{ width: "fit-content", alignSelf: "center" }}
					variant="contained"
					onClick={postUpdate}>
					Update
				</Button>
			</Box>
		</Box>
	);
};

export default ClassificationForm;

const renderOptions = () => {
	const options = [
		"id",
		"name",
		"email",
		"phone",
		"zip",
		"city",
		"birth",
		"street",
		"ussocialsec",
		"ip4address",
		"creditcard",
		"germandriverlicense",
		"germanphone",
		"germaniban",
		"germanlicenseplate",
		"germancellphone",
		"germanbanknr",
	];

	return [
		<MenuItem value="">None</MenuItem>,
		...options.map((item) => {
			return <MenuItem value={item}>{item}</MenuItem>;
		}),
	];
};
