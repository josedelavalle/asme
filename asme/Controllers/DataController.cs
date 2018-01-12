using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using asme.Models;
using Newtonsoft.Json;
using System.Web.Script.Serialization;

namespace asme.Controllers
{
    public class DataController : Controller
    {
        [OutputCache(Duration = 86400)]
        public JsonResult GetTopics(string pagenum = "1")
        {
            try
            {
                var url = string.Format("https://www.asme.org/asme/handlers/Topics.ashx?pageNumber={0}&id=af50959c-79da-4725-85e7-66926e499806&_=1515717263961", pagenum);
                //var topics = _download_serialized_json_data<Topics>(url);   
                var json_data = string.Empty;

                using (var w = new WebClient())
                {
                    
                    // attempt to download JSON data as a string
                    json_data = w.DownloadString(url);
                }

                List<Topics> topics = (new JavaScriptSerializer()).Deserialize<List<Topics>>(json_data);

                return Json(new
                {
                    status = "ok",
                    page = pagenum,
                    topics = topics
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new
                {
                    status = "error",
                    message = e.ToString()
                }, JsonRequestBehavior.AllowGet);
            }
        }

        private static T _download_serialized_json_data<T>(string url) where T : new()
        {
            using (var w = new WebClient())
            {
                var json_data = string.Empty;
                // attempt to download JSON data as a string
                try
                {
                    json_data = w.DownloadString(url);
                }
                catch (Exception) { }
                // if string with JSON data is not empty, deserialize it to class and return its instance 
                
                return !string.IsNullOrEmpty(json_data) ? JsonConvert.DeserializeObject<T>(json_data) : new T();
            }
        }
    }
}