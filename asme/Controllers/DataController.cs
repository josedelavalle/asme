using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using asme.Models;
using Newtonsoft.Json;
using System.Xml.Linq;
using System.Web.Script.Serialization;
using HtmlAgilityPack;


namespace asme.Controllers
{
    public class DataController : Controller
    {

        [OutputCache(Duration = 86400)]
        public JsonResult GetProducts(string PageNum = "1")
        {
            try
            {
                string url = string.Format("https://www.asme.org/ASME/Handlers/ListPageResults.ashx?thePage={0}&resultsPerPage=50&_=1515815423535", PageNum);

                ProductViewModel Products = DownloadSerializedJson<ProductViewModel>(url);

                return Json(new
                {
                    status = "ok",
                    page = PageNum,
                    products = Products
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

        [OutputCache(Duration = 86400)]
        public JsonResult GetTopics(string PageNum = "1")
        {
            try
            {
                string url = string.Format("https://www.asme.org/asme/handlers/Topics.ashx?pageNumber={0}&id=af50959c-79da-4725-85e7-66926e499806&_=1515717263961", PageNum);

                List<Topic> Topics = DownloadSerializedJson<List<Topic>>(url);

                return Json(new
                {
                    status = "ok",
                    page = PageNum,
                    topics = Topics
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

        [OutputCache(Duration = 86400)]
        public JsonResult GetEvents()
        {
            try
            {
                string myUrl = "https://www.asme.org/events-map";

                HtmlWeb web = new HtmlWeb();
                List<Event> Events = new List<Event>();
                HtmlAgilityPack.HtmlDocument doc = web.Load(myUrl);
                
                var eventsInDOM = doc.DocumentNode.SelectNodes("//table");

                for (var i = 1; i < eventsInDOM.Count; i++)
                {
                    var Date = doc.DocumentNode.SelectSingleNode(String.Format("/html[1]/body[1]/form[1]/div[5]/div[1]/div[4]/div[4]/div[4]/table[{0}]/tr[1]/td[1]", i)).InnerText;
                    var ThisEvent = doc.DocumentNode.SelectSingleNode(String.Format("/html[1]/body[1]/form[1]/div[5]/div[1]/div[4]/div[4]/div[4]/table[{0}]/tr[1]/td[2]", i));
                    var Location = doc.DocumentNode.SelectSingleNode(String.Format("/html[1]/body[1]/form[1]/div[5]/div[1]/div[4]/div[4]/div[4]/table[{0}]/tr[1]/td[3]", i)).InnerText;
                    if (!String.IsNullOrEmpty(ThisEvent.InnerText))
                    {
                        Event e = new Event();
                        e.id = "event" + i;
                        e.Date = Date.Trim();
                        e.Name = ThisEvent.InnerText.Trim();
                        e.Link = ThisEvent.FirstChild.Attributes["href"].Value;
                        e.Location = Location.Trim();
                        var Geocoded = GeocodeLocation(e.Location);
                        if (Geocoded != null)
                        {
                            List<decimal> c = new List<decimal>();
                            c.Add(Geocoded.Item1);
                            c.Add(Geocoded.Item2);
                            e.Coordinates = c;
                        }
                        Events.Add(e);
                    }
                }
                
                return Json(new
                {
                    status = "ok",
                    events = Events
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

        
        private static Tuple<decimal, decimal> GeocodeLocation(string loc)
        {
            try
            {
                string requestUri = string.Format("https://maps.googleapis.com/maps/api/geocode/xml?key=AIzaSyBPsDaLY2SWLxNqHNbZzjkMBgGVisLqFx8&address={0}&sensor=false", Uri.EscapeDataString(loc));

                WebRequest request = WebRequest.Create(requestUri);
                WebResponse response = request.GetResponse();
                XDocument xdoc = XDocument.Load(response.GetResponseStream());

                XElement result = xdoc.Element("GeocodeResponse").Element("result");
                XElement locationElement = result.Element("geometry").Element("location");
                XElement lat = locationElement.Element("lat");
                XElement lng = locationElement.Element("lng");

                return Tuple.Create(Convert.ToDecimal(lat.Value), Convert.ToDecimal(lng.Value));            }
            catch (Exception e)
            {
                return null;
            }
        }

        private static T DownloadSerializedJson <T>(string url) where T : new()
        {
            using (var wc = new WebClient())
            {
                var JsonData = string.Empty;
                try
                {
                    JsonData = wc.DownloadString(url);
                }
                catch (Exception)
                {
                    return new T();
                }

                return !string.IsNullOrEmpty(JsonData) ? JsonConvert.DeserializeObject<T>(JsonData) : new T();
            }
        }

    }
}