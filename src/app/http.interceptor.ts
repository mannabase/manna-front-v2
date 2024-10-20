import { HttpInterceptorFn } from '@angular/common/http'
import {LoadingService} from "./loading.service"
import {inject} from "@angular/core"
import {finalize} from "rxjs"

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
    let loadingService = inject(LoadingService)
    loadingService.setLoading(true)
    return next(req)
        .pipe(
            finalize(() => {
                loadingService.setLoading(false)
            }),
        )
}
