import { LoginResponse } from "./loginResponse";
import { Photo as PhotoType } from "@/actions/photos.action";

declare global {
    var photos: PhotoType[];
    var auth: LoginResponse;
  }