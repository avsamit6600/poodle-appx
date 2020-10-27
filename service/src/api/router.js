const express = require('express')
const dotProp = require('dot-prop')
const db = require('../db/db')
const cache = require('../cache/cache')
const { log_api_status, get_api_spec, SUCCESS, FAILURE } = require('./util')
const { handle_get } = require('./get')
const { handle_upsert } = require('./upsert')
const { handle_update } = require('./update')
const { handle_delete } = require('./delete')

// track a list of endpoints
// let endpoints = []

function handle_req(api_context, req, res) {

    // check api_spec
    let api_spec = get_api_spec(api_context, req, res)
    if (! api_spec) {
        return
    }

    // handle request by verb
    switch(api_spec.syntax.verb) {
        case "get":
            handle_get(api_context, req, res)
            return

        case "upsert":
            handle_upsert(api_context, req, res)
            return

        case "update":
            handle_update(api_context, req, res)
            return

        case "delete":
            handle_delete(api_context, req, res)
            return

        case "status":
        default:
            log_api_status(api_context, FAILURE,
                `ERROR: unsupported verb [${api_spec.syntax.verb}] - [${JSON.stringify(api_spec)}]`)
    }
}

function get_router(namespace, runtime_name, app_name) {

    let api_results = db.query_sync(`SELECT
                    api.namespace,
                    api.app_name,
                    api.app_ver,
                    deployment.runtime_name,
                    api.obj_name,
                    api.api_method,
                    api.api_endpoint,
                    api.api_spec,
                    deployment.deployment_spec,
                    api.create_time,
                    api.update_time
                FROM api
                JOIN deployment
                    ON api.namespace = deployment.namespace
                    AND api.app_name = deployment.app_name
                    AND api.app_ver = deployment.app_ver
                WHERE
                    api.namespace = '${namespace}'
                    AND deployment.runtime_name = '${runtime_name}'
                    AND api.app_name = '${app_name}'
                    AND api.deleted=0
                    AND deployment.deleted=0`)

    let router = express.Router()

    api_results.forEach((api_result) => {

        let api_context = {
            namespace: api_result.namespace,
            runtime_name: api_result.runtime_name,
            app_name: api_result.app_name,
            obj_name: api_result.obj_name,
            api_method: api_result.api_method,
            api_endpoint: api_result.api_endpoint
        }

        switch (api_result.api_method) {

            case "get":

                router.get(api_result.api_endpoint, (req, res) => {

                    handle_req(api_context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "post":
                router.post(api_result.api_endpoint, (req, res) => {

                    handle_req(api_context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "put":
                router.put(api_result.api_endpoint, (req, res) => {

                    handle_req(api_context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "delete":
                router.delete(api_result.api_endpoint, (req, res) => {

                    handle_req(api_context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            default:
                log_api_status(api_result, FAILURE,
                    `unknow api method: ${api_result.api_method} [${JSON.stringify(api_result)}]`)
        }
    });

    return router
}

//export this router to use in our index.js
module.exports = {
    get_router: get_router
}
